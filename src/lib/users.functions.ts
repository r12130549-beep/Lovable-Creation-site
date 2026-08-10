import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getAllUsersAdmin, updateUserStatus, deleteUser, updateUserRole as updateUserRoleServer } from "./users.server";

export const getAdminUsers = createServerFn({ method: "GET" })
  .handler(async () => {
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
    return updateUserRoleServer(data.userId, data.role);
  });