"use client";

import Link from "next/link";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { FolderKanban, Users, CheckSquare } from "lucide-react";

interface Member {
  id: string;
  role: string;
  user: { id: string; name: string; email: string };
}

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    description: string | null;
    ownerId: string;
    owner: { id: string; name: string; email: string };
    members: Member[];
    _count: { tasks: number };
  };
}

export default function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`} className="block group">
      <div className="h-full rounded-md border bg-card p-4 transition-all duration-150 ease-out hover:shadow-md group-hover:-translate-y-0.5">
        <div className="flex items-center gap-2.5 mb-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0">
            <FolderKanban className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-semibold text-foreground line-clamp-1">{project.name}</h3>
        </div>

        {project.description && (
          <p className="text-[13px] text-muted-foreground line-clamp-2 mb-3">{project.description}</p>
        )}

        <div className="flex items-center justify-between mt-auto">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckSquare className="h-3 w-3" />
              {project._count.tasks}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" />
              {project.members.length}
            </span>
          </div>
          <div className="flex -space-x-1.5">
            {project.members.slice(0, 3).map((m) => (
              <Avatar key={m.id} className="h-5 w-5 border-2 border-card" title={m.user.name}>
                <AvatarFallback className="text-[8px] bg-primary/10 text-primary">
                  {m.user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            ))}
            {project.members.length > 3 && (
              <Badge variant="secondary" className="h-5 rounded-full px-1 text-[8px]">
                +{project.members.length - 3}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
