import { Person, Group, VaultItem, AuditLog } from '../models/index.js';
import { hashIp } from '../services/deviceService.js';

export const getPersons = async (req, res, next) => {
  try {
    const { groupUuid } = req.params;

    const group = await Group.findOne({ uuid: groupUuid, userId: req.userId });
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    const persons = await Person.find({ userId: req.userId, groupUuid })
      .sort({ order: 1 })
      .select('-_id -__v')
      .lean();

    // Compute vault item counts dynamically for each person
    const personUuids = persons.map(p => p.uuid);
    const counts = await VaultItem.aggregate([
      { $match: { userId: req.userId, personUuid: { $in: personUuids }, isDeleted: false } },
      { $group: { _id: '$personUuid', count: { $sum: 1 } } }
    ]);
    const countMap = {};
    counts.forEach(c => { countMap[c._id] = c.count; });

    const personsWithCounts = persons.map(p => ({
      ...p,
      vaultItemCount: countMap[p.uuid] || 0
    }));

    res.status(200).json({
      success: true,
      data: {
        persons: personsWithCounts,
        group: { uuid: group.uuid, name: group.name, icon: group.icon, color: group.color, memberCount: persons.length }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const createPerson = async (req, res, next) => {
  try {
    const { groupUuid } = req.params;
    const { fullName, nickname, avatar } = req.body;

    if (!fullName || !fullName.trim()) {
      return res.status(400).json({ success: false, message: 'Full name is required' });
    }

    const group = await Group.findOne({ uuid: groupUuid, userId: req.userId });
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    const maxOrder = await Person.findOne({ userId: req.userId, groupUuid }).sort({ order: -1 });
    const person = await Person.create({
      userId: req.userId,
      groupUuid,
      fullName: fullName.trim(),
      nickname: nickname?.trim() || '',
      avatar: avatar || '',
      order: maxOrder ? maxOrder.order + 1 : 0
    });

    await Group.updateOne({ _id: group._id }, { $inc: { memberCount: 1 } });

    await AuditLog.create({
      userId: req.userId,
      userUuid: req.userUuid,
      action: 'PERSON_CREATE',
      resourceType: 'person',
      resourceUuid: person.uuid,
      ipHash: hashIp(req.ip),
      userAgent: req.headers['user-agent'],
      requestId: req.id
    });

    const safePerson = person.toObject();
    delete safePerson._id;
    delete safePerson.__v;
    res.status(201).json({ success: true, data: { person: safePerson } });
  } catch (error) {
    next(error);
  }
};

export const getPerson = async (req, res, next) => {
  try {
    const { groupUuid, uuid } = req.params;

    const group = await Group.findOne({ uuid: groupUuid, userId: req.userId });
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    const person = await Person.findOne({ uuid, userId: req.userId, groupUuid })
      .select('-_id -__v');
    if (!person) return res.status(404).json({ success: false, message: 'Person not found' });

    const vaultItemCount = await VaultItem.countDocuments({
      userId: req.userId, personUuid: uuid, isDeleted: false
    });

    res.status(200).json({
      success: true,
      data: {
        person: { ...person.toObject(), vaultItemCount },
        group: { uuid: group.uuid, name: group.name, icon: group.icon, color: group.color }
      }
    });
  } catch (error) {
    next(error);
  }
};

export const updatePerson = async (req, res, next) => {
  try {
    const { groupUuid, uuid } = req.params;
    const { fullName, nickname, avatar } = req.body;

    const group = await Group.findOne({ uuid: groupUuid, userId: req.userId });
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    const person = await Person.findOne({ uuid, userId: req.userId, groupUuid });
    if (!person) return res.status(404).json({ success: false, message: 'Person not found' });

    if (fullName !== undefined) person.fullName = fullName.trim();
    if (nickname !== undefined) person.nickname = nickname.trim();
    if (avatar !== undefined) person.avatar = avatar;
    person.updatedAt = new Date();
    await person.save();

    const safePerson = person.toObject();
    delete safePerson._id;
    delete safePerson.__v;
    res.status(200).json({ success: true, data: { person: safePerson } });
  } catch (error) {
    next(error);
  }
};

export const deletePerson = async (req, res, next) => {
  try {
    const { groupUuid, uuid } = req.params;

    const group = await Group.findOne({ uuid: groupUuid, userId: req.userId });
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    const person = await Person.findOne({ uuid, userId: req.userId, groupUuid });
    if (!person) return res.status(404).json({ success: false, message: 'Person not found' });

    await VaultItem.updateMany(
      { userId: req.userId, personUuid: uuid, isDeleted: false },
      { $set: { isDeleted: true, deletedAt: new Date(), isFavorite: false } }
    );

    await Person.deleteOne({ _id: person._id });
    await Group.updateOne({ _id: group._id }, { $inc: { memberCount: -1 } });

    await AuditLog.create({
      userId: req.userId,
      userUuid: req.userUuid,
      action: 'PERSON_DELETE',
      resourceType: 'person',
      resourceUuid: uuid,
      ipHash: hashIp(req.ip),
      userAgent: req.headers['user-agent'],
      requestId: req.id
    });

    res.status(200).json({ success: true, message: 'Person deleted successfully' });
  } catch (error) {
    next(error);
  }
};

export const reorderPersons = async (req, res, next) => {
  try {
    const { groupUuid } = req.params;
    const { orderings } = req.body;

    if (!Array.isArray(orderings)) {
      return res.status(400).json({ success: false, message: 'Orderings must be an array' });
    }

    const group = await Group.findOne({ uuid: groupUuid, userId: req.userId });
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    const bulkOps = orderings.map(({ uuid, order }) => ({
      updateOne: {
        filter: { uuid, userId: req.userId, groupUuid },
        update: { $set: { order } }
      }
    }));

    await Person.bulkWrite(bulkOps);
    res.status(200).json({ success: true, message: 'People reordered' });
  } catch (error) {
    next(error);
  }
};

export const toggleFavoritePerson = async (req, res, next) => {
  try {
    const { groupUuid, uuid } = req.params;

    const person = await Person.findOne({ uuid, userId: req.userId, groupUuid });
    if (!person) return res.status(404).json({ success: false, message: 'Person not found' });

    person.isFavorite = !person.isFavorite;
    person.updatedAt = new Date();
    await person.save();

    const safePerson = person.toObject();
    delete safePerson._id;
    delete safePerson.__v;
    res.status(200).json({ success: true, data: { person: safePerson } });
  } catch (error) {
    next(error);
  }
};
