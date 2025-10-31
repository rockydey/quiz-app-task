import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { PositionsModule } from "./positions/positions.module";
import { QuizzesModule } from "./quizzes/quizzes.module";

@Module({
  imports: [PrismaModule, PositionsModule, QuizzesModule],
})
export class AppModule {}
