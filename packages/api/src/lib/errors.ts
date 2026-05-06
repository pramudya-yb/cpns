import { TRPCError } from "@trpc/server";

export function throwUnauthorized(message = "Unauthorized"): never {
  throw new TRPCError({ code: "UNAUTHORIZED", message });
}

export function throwForbidden(message = "Forbidden"): never {
  throw new TRPCError({ code: "FORBIDDEN", message });
}

export function throwNotFound(resource = "Resource"): never {
  throw new TRPCError({ code: "NOT_FOUND", message: `${resource} not found` });
}

export function throwBadRequest(message = "Bad request"): never {
  throw new TRPCError({ code: "BAD_REQUEST", message });
}

export function throwInternal(message = "Internal server error"): never {
  throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message });
}
