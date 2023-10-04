import { CustomRequest, CustomRequestHandler } from "@/types/api";
import { NextRequest, NextResponse } from "next/server";

class RequestHandler<Params = unknown, Body = unknown, Query = unknown> {
  #index = 0;
  #res = undefined as NextResponse | undefined;
  req = {} as CustomRequest;

  constructor(req: NextRequest, ctx?: { params: Params }) {
    this.req = req as CustomRequest<Params, Body, Query>;
    this.req.params = ctx?.params || {};
    this.req.parsedBody = {};
  }

  async run(...handlers: CustomRequestHandler[]) {
    const body = await parseBody<Body>(this.req);
    this.req.parsedBody = body;
    try {
      const next = async (err: unknown) => {
        if (err instanceof Error) {
          throw err;
        }
        this.#index++;
        const nextHandler = handlers[this.#index];
        if (nextHandler !== undefined) {
          const res = await nextHandler(this.req, next);
          if (res) this.#res = res;
        }
      };

      const handler = handlers[0];
      if (handler !== undefined) {
        const res = await handler(this.req, next);
        if (res) this.#res = res;
      }
    } catch (err: unknown) {
      let message = "Internal Server Error";
      let statusCode = 500;
      if (err instanceof Error) {
        message = err.message || message;
      }
      this.#res = NextResponse.json({ message }, { status: statusCode });
    } finally {
      return this.#res || NextResponse.json("something");
    }
  }
}
export default RequestHandler;

async function parseBody<Body = unknown>(req: NextRequest): Promise<Body> {
  try {
    const body = await req.json();
    return body;
  } catch (error) {
    return {} as Body;
  }
}
