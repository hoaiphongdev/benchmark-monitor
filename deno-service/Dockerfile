FROM denoland/deno:1.39.0

WORKDIR /app

COPY . .

# Cache the dependencies
RUN deno cache main.ts

EXPOSE 8000

CMD ["deno", "run", "--allow-net", "--allow-env", "main.ts"] 