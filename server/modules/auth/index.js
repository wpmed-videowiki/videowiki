import routes from './routes';
import passport from './config/passport/init';
import services from './services';
import './crons'; 

services.rabbitmq.initRabbitMQ();

export default {
  passport,
  routes: (passport) => routes(passport),
};
