import RequestHandler from "@/lib/requestHandler";
import { CustomRequestHandler, NextRequestHandler } from "@/types/api";
import { NextResponse } from "next/server";

const firstMiddleware: CustomRequestHandler = async (req, next) => {
  console.log("first middleware");
  const start = Date.now();
  await next();
  console.log(`Request completed in ${Date.now() - start}ms`);
};

const secondMiddleware: CustomRequestHandler = async (req, next) => {
  console.log("second middleware");
  await next();
};

const thirdMiddleware: CustomRequestHandler = (req) => {
  console.log("third middleware");
  return NextResponse.json({
    text: "GET: /api/hello \nRequest Completed successfully",
  });
};

export const GET: NextRequestHandler = async (req, ctx) => {
  const handler = new RequestHandler(req, ctx);
  return handler.run(firstMiddleware, secondMiddleware, thirdMiddleware);
};

export const POST: NextRequestHandler = async (req, ctx) => {
  const handler = new RequestHandler(req, ctx);
  return handler.run((req, next) => {
    return NextResponse.json({
      params: req.params,
      body: req.parsedBody,
    });
  });
};
