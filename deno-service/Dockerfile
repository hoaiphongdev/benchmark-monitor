FROM denoland/deno:1.39.0

WORKDIR /app

COPY deno.json deno.json
COPY deno.lock deno.lock
COPY main.ts main.ts

RUN deno cache main.ts

EXPOSE 8000

USER deno

CMD ["deno", "run", "--allow-net", "--allow-env", "main.ts"] 