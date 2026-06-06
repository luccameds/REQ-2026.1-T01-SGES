import { Router } from "express";
import authRoute from "./auth-route";

const route = Router({ mergeParams: true });

route.post('/', authRoute);

export default route;