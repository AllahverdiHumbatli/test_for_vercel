import {NextFunction, Request, Response} from "express";
import {ValidationError, validationResult} from "express-validator";

export const inputValidation = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const errorFormatter = ({
                                location,
                                msg,
                                param,
                                value,
                                nestedErrors,
                            }: ValidationError) => {
        return {message: msg, field: param};
    };
    const result = validationResult(req).formatWith(errorFormatter);
    if (!result.isEmpty()) return res
        .status(400)
        .send({errorsMessages: result.array({onlyFirstError: true})});

    return next();

};