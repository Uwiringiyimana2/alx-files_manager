import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import { basicAuthenticate, xTokenAuthenticate } from '../middlewares/auth';

function appRoutes(app) {
  app.get('/status', AppController.getStatus);
  app.get('/stats', AppController.getStats);

  app.post('/users', UsersController.postNew);

  app.get('/connect', basicAuthenticate, AuthController.getConnect);
  app.get('/disconnect', xTokenAuthenticate, AuthController.getDisconnect);
  app.get('/users/me', xTokenAuthenticate, UsersController.getMe);
}

export default appRoutes;
