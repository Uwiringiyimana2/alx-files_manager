import sha1 from 'sha1';
import Queue from 'bull/lib/queue';
import dbClient from '../utils/db';

const userQueue = new Queue('email sending');

export default class UsersController {
  static async postNew(req, res) {
    const email = req.body ? req.body.email : null;
    const password = req.body ? req.body.password : null;

    if (!email) {
      res.status(400).json({ error: 'Missing email' });
      return;
    }
    if (!password) {
      res.status(400).json({ error: 'Missing password' });
      return;
    }
    const user = await (await dbClient.usersCollection()).findOne({ email });

    if (user) {
      res.status(400).json({ error: 'Already exist' });
      return;
    }

    try {
      const newUser = await (await dbClient.usersCollection()).insertOne({
        email,
        password: sha1(password),
      });
      const userId = newUser.insertedId.toString();

      userQueue.add({ userId });
      res.status(201).json({
        id: newUser.insertedId.toString(),
        email,
      });
    } catch (error) {
      console.error('Error inserting user:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }

  static async getMe(req, res) {
    const { user } = req;
    res.status(200).json({
      email: user.email,
      id: user._id.toString(),
    });
  }
}
