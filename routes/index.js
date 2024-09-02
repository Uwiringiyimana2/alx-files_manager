import AppController from '../controllers/AppController';
import UsersController from '../controllers/UsersController';
import AuthController from '../controllers/AuthController';
import FilesController from '../controllers/FilesController'
import { basicAuthenticate, xTokenAuthenticate } from '../middlewares/auth';

function appRoutes(app) {
  // app controller
  app.get('/status', AppController.getStatus);
  app.get('/stats', AppController.getStats);

  // Creating and retrieving Users
  app.post('/users', UsersController.postNew);
  app.get('/users/me', xTokenAuthenticate, UsersController.getMe);

  // user authentication
  app.get('/connect', basicAuthenticate, AuthController.getConnect);
  app.get('/disconnect', xTokenAuthenticate, AuthController.getDisconnect);

  // Creating a new file in DB and in disk
  app.post('/files', xTokenAuthenticate, FilesController.postUpload);
}

export default appRoutes;
