![image](https://i.imgur.com/Q0tDYvA.png)

# How To
Download this repository. Install node (**this is tested with 18.15.0**) and pnpm. Then use on a terminal, in the bot folder:

- ```sh
  pnpm instal
  ```

- Edit the `.env.sample` file.

- Run
  ```sh
  node deploy-commands guild
  ```
  Or, if you are going to add the bot to more than one server,
  ```sh
  node deploy-commands global
  ```

- Rename `.env.sample` to `.env`.

- Run
  ```sh
  npx prisma migrate deploy
  ```

Then, for starting the bot use:

```sh
pnpm run start
```

And the bot is running.
