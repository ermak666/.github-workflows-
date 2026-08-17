import { COOKIE_NAME } from "../shared/const.js";
import { fallbackCodeFeedback, normalizeCoachFeedback } from "../shared/code-coach.js";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";

export const appRouter = router({
  // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  codeCoach: router({
    analyze: publicProcedure.input(z.object({ code: z.string().max(3500), task: z.string().max(800), level: z.string().max(80) })).mutation(async ({ input }) => {
      const fallback = fallbackCodeFeedback(input.code);
      if (fallback.status === "caution" || !input.code.trim()) return fallback;
      try {
        const response = await invokeLLM({
          model: "claude-haiku-4-5",
          maxTokens: 700,
          messages: [
            { role: "system", content: "Ты доброжелательный преподаватель Python для начинающего. Не выполняй код и не обещай его запуск. Отвечай только JSON-объектом: status (needs_fix|looks_good|caution), headline, issues (массив до 3 коротких пунктов), hint, nextStep. Не давай полный готовый ответ задачи; дай один понятный следующий шаг. Если заметишь реальные ключи, пароли или токены, попроси удалить их. Пиши по-русски, очень простыми словами." },
            { role: "user", content: `Уровень: ${input.level}\nЗадача: ${input.task}\nУчебный код:\n${input.code}` },
          ],
          response_format: { type: "json_object" },
        });
        const raw = response.choices?.[0]?.message?.content;
        const parsed = typeof raw === "string" ? JSON.parse(raw) : null;
        return normalizeCoachFeedback(parsed, fallback);
      } catch {
        return { ...fallback, headline: "Помощник временно недоступен", hint: "Проверьте сообщение встроенного тренажёра и попробуйте снова немного позже." };
      }
    }),
  }),

  // TODO: add feature routers here, e.g.
  // todo: router({
  //   list: protectedProcedure.query(({ ctx }) =>
  //     db.getUserTodos(ctx.user.id)
  //   ),
  // }),
});

export type AppRouter = typeof appRouter;
