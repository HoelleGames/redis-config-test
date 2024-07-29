# Redis Configuration and Failover Task

## Step 1: Basic Redis Setup
1. Start a simple Redis instance using the provided `docker-compose.yml` file.
2. Install necessary NPM modules.
3. Run `src/redis.ts` to test the Redis server configuration.
   Expected output should resemble:
   ![Redis test output](image-1.png)

## Step 2: Implement Failsafe Redis
Create a new `docker-compose.yml` file to set up a failsafe Redis installation.

Provide at least two solutions, including pros and cons for each:

1. Solution A: [Brief description]
   - Pros:
     - ...
   - Cons:
     - ...

2. Solution B: [Brief description]
   - Pros:
     - ...
   - Cons:
     - ...

## Step 3: Test Failover
1. Modify `src/redis.ts` to work with the new failsafe Redis installation.
2. Test the failover mechanism - the job `src/redis.ts` should continue to run and be able to write / read from the Redis installation even if a cluster component is restarted / crashes without interruption or need of restarting it.
3. If unsuccessful, explain:
   - Why it didn't work
   - Necessary changes to `src/redis.ts` to make the job fault tolerant

