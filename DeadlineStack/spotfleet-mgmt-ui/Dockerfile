# Stage 1: Build React App
FROM node:20-alpine as build
WORKDIR /app
COPY . .
# RUN cd client && npm install && npm run build
RUN cd client && npm install
RUN cd client && npm run build


# Stage 2: Build FastAPI App
FROM tiangolo/uvicorn-gunicorn-fastapi:python3.10 as production
WORKDIR /app
COPY --from=build /app/client/build /app/build
COPY server/main.py /app/main.py

# Expose port 4242 for FastAPI app
EXPOSE 4242

# Command to run the application
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "4242"]
