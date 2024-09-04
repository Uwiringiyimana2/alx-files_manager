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
  app.get('/files/:id', xTokenAuthenticate, FilesController.getShow);
  app.get('/files', xTokenAuthenticate, FilesController.getIndex);
  app.put('/files/:id/publish', xTokenAuthenticate, FilesController.putPublish);
  app.put('/files/:id/unpublish', xTokenAuthenticate, FilesController.putUnpublish);
  app.get('/files/:id/data', xTokenAuthenticate, FilesController.getFile);
}

export default appRoutes;
