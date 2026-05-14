import express from 'express';
import { OnlinePaymentController } from '../../controllers/v1/onlinePayment.controller';
import { AuthMiddleware } from '../../middleware/auth.middleware';

const onlinePaymentRouter = express.Router();
const controller = new OnlinePaymentController();

onlinePaymentRouter.post(
    '/buy-online',
    AuthMiddleware.authenticate,
    (req, res) => controller.createPayment(req, res));
onlinePaymentRouter.get('/vnpay-ipn', (req, res) => controller.vnpayIPN(req, res));

export default onlinePaymentRouter;