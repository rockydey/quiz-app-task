import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateQuizDto } from "./dto/create-quiz.dto";
import { UpdateQuizDto } from "./dto/update-quiz.dto";

@Injectable()
export class QuizzesService {
  constructor(private readonly prisma: PrismaService) {}

  create(dto: CreateQuizDto) {
    return this.prisma.test.create({
      data: {
        name: dto.name,
        date: new Date(dto.date),
        durationMin: dto.durationMin,
        positionId: dto.positionId,
      },
    });
  }

  findAll() {
    return this.prisma.test.findMany({
      orderBy: { date: "desc" },
      include: { position: true, groups: true },
    });
  }

  async findOne(id: string) {
    const quiz = await this.prisma.test.findUnique({
      where: { id },
      include: { position: true, groups: { include: { questions: true } } },
    });
    if (!quiz) throw new NotFoundException("Quiz not found");
    return quiz;
  }

  async update(id: string, dto: UpdateQuizDto) {
    await this.findOne(id);
    return this.prisma.test.update({
      where: { id },
      data: {
        ...dto,
        ...(dto.date ? { date: new Date(dto.date) } : {}),
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.test.delete({ where: { id } });
  }
}
