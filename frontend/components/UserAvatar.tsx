"use client";

import React from "react";
import { Avatar, type AvatarProps, type AvatarSize } from "@/components/ui/avatar";

export interface UserAvatarProps {
  name?: string | null;
  surname?: string | null;
  avatarUrl?: string | null;
  size?: AvatarSize;
  className?: string;
}

export { getInitials } from "@/components/ui/avatar";

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  surname,
  avatarUrl,
  size = "md",
  className,
}) => {
  return (
    <Avatar
      name={name || "Usuario"}
      surname={surname}
      src={avatarUrl}
      type="person"
      size={size}
      className={className}
    />
  );
};

export default UserAvatar;
