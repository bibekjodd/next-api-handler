import qs from "qs";
import { CustomRequest, CustomRequestHandler } from "@/types/api";
import { NextRequest, NextResponse } from "next/server";
import CustomError from "./customError";

class RequestHandler<Params = any, ReqBody = any, Query = any> {
  #index = 0;
  #res = undefined as NextResponse | undefined;
  req = {} as CustomRequest<Params, ReqBody, Query>;

  constructor(req: NextRequest, ctx?: any) {
    this.req = req as CustomRequest<Params, ReqBody, Query>;
    this.req.params = (ctx?.params || {}) as Params;
    this.req.parsedBody = {} as ReqBody;
    const query = decodeSearchParams(req.url);
    this.req.query = query as Query;
  }

  async run(...handlers: CustomRequestHandler<Params, ReqBody, Query>[]) {
    const body = await parseBody<ReqBody>(this.req);
    this.req.parsedBody = body as ReqBody;
    try {
      const next = async () => {
        this.#index++;
        const nextHandler = handlers[this.#index];
        if (nextHandler !== undefined) {
          const res = await nextHandler(this.req, NextResponse, next);
          if (res) this.#res = res;
        }
      };

      const handler = handlers[0];
      if (handler !== undefined) {
        const res = await handler(this.req, NextResponse, next);
        if (res) this.#res = res;
      }
    } catch (err: unknown) {
      let message = "Internal Server Error";
      let statusCode = 500;
      if (err instanceof Error) {
        message = err.message || message;
      }
      if (err instanceof CustomError) {
        statusCode = err.statusCode || statusCode;
        message = err.message;
      }
      this.#res = NextResponse.json({ message }, { status: statusCode });
    } finally {
      return (
        this.#res ||
        NextResponse.json({ message: "Internal Server Error" }, { status: 500 })
      );
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

function decodeSearchParams<Query = unknown>(url: string): Query {
  const { search } = new URL(url);
  const query = qs.parse(search.substring(1));
  return query as Query;
}
