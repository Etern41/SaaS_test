"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
      <Card className="h-full transition-all duration-200 hover:shadow-md hover:border-primary/30 group-hover:-translate-y-0.5">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
                <FolderKanban className="h-4 w-4" />
              </div>
              <CardTitle className="text-base line-clamp-1">{project.name}</CardTitle>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {project.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{project.description}</p>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <CheckSquare className="h-3.5 w-3.5" />
                {project._count.tasks}
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {project.members.length}
              </span>
            </div>
            <div className="flex -space-x-1.5">
              {project.members.slice(0, 3).map((m) => (
                <Avatar key={m.id} className="h-6 w-6 border-2 border-card" title={m.user.name}>
                  <AvatarFallback className="text-[9px] bg-primary/10 text-primary">
                    {m.user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
              {project.members.length > 3 && (
                <Badge variant="secondary" className="h-6 rounded-full px-1.5 text-[9px]">
                  +{project.members.length - 3}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
