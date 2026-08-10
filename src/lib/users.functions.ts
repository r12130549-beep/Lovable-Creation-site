import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";


export const getAdminUsers = createServerFn({ method: "GET" })
  .handler(async () => {
    const { getAllUsersAdmin } = await import("./users.server");
    return getAllUsersAdmin();
  });

export const toggleUserStatus = createServerFn({ method: "POST" })
  .validator((data: any) => {
    const raw = data?.data || data;
    return z.object({
      userId: z.string(),
      isSuspended: z.boolean()
    }).parse(raw);
  })
  .handler(async ({ data }) => {
    const { updateUserStatus } = await import("./users.server");
    return updateUserStatus(data.userId, data.isSuspended);
  });

export const removeUser = createServerFn({ method: "POST" })
  .validator((data: any) => {
    const raw = data?.data || data;
    return z.object({
      userId: z.string()
    }).parse(raw);
  })
  .handler(async ({ data }) => {
    const { deleteUser } = await import("./users.server");
    return deleteUser(data.userId);
  });

export const updateUserRole = createServerFn({ method: "POST" })
  .validator((data: any) => {
    const raw = data?.data || data;
    return z.object({
      userId: z.string(),
      role: z.string()
    }).parse(raw);
  })
  .handler(async ({ data }) => {
    const { updateUserRole: updateUserRoleServer } = await import("./users.server");
    return updateUserRoleServer(data.userId, data.role);
  });