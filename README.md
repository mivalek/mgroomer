# The Matt Groomer 🧗

Community-powered pronunciation guide for IFSC athletes

## Motivation

I like watching [IFSC](https://www.ifsc-climbing.org/) competitions. Climbing is a great sport, the comps are exciting, and the commentary is good. However, [Matt Groom](https://www.instagram.com/mattgroom1/?hl=en), the commentator (as of 2025) sometimes understandably struggles with pronouncing non-anglophone names of athletes. This app is intended to provide a repository of pronunciation guide audio recordings to help him out. Contributions are very welcome!

## 🚀 Quick start (Docker)

The easiest way to get your own version of this app running is with [Docker](https://docs.docker.com/) compose:

1. Clone the repository

    ```
    git clone https://github.com/mivalek/mgroomer.git
    cd mgroomer
    ```

1. Configure your environment

    Copy and edit the sample environment file.

    ```
    cp .env.local.sample .env.local
    ```

1. Build and run the containers

    This command will build the images and start all the services (frontend, backend, file server, mariadb database, and nginx  ).

    ```
    docker compose --env-file .env.local up --build
    ```

1. You're ready!

    Open the app in your browser: http://localhost

## ⚙️ Configuration

The app is configured using the following environment variables:

Variable | Description | Default (.env.local.sample)
---------|-------------|----------------------------
`ADMIN` | Value of the `?admin=` search parameter that enables the amin mode | `my-admin-password`
`API` | Backend API endpoints (based on Docker container name); must match `API_PORT` | `http://backend:8080/api/v1`
`API_KEY` | Authorization for requests to API endpoints | `my-secret-key`
`FILE_SERVER` | Address of the file server (based on Docker container name). DO NOT CHANGE! | `http://file-server:8800/media`
`VITE_PUBLIC_FILE_SERVER` | Public variable. Path to file server from the frontend Solid Start app.  DO NOT CHANGE! | `/media`
`DB_USER` | Mariadb database user name | `root`
`DB_PASSWORD` | Mariadb database password | `my-mariadb-password`
`DB_HOST` | Mariadb database host (based on Docker container name) | `mgroomer-db`
`DB_PORT` | Mariadb database port | `3306`
`DB_NAME` | Mariadb database name | `mgroomerdb`
`STORAGE_PATH` | Path where backend stores recordings. DO NOT CHANGE! | `/media/audio`
`PORT` | Frontend Solid Start app port | `3000`
`API_PORT` | Backend API server port | `8080`

## 🙌 Contributing

Contributions are welcome!

1. Fork the repository & create a new feature branch.
2. Follow the [Local Development guide](https://www.google.com/search?q=%23-local-development-without-docker) to set up your environment.
3. Make your changes.
4. Open a pull request with a clear description of your changes.

## 📜 License

This project is licensed under the GNU GPLv3 License. Copyright © 2025 Milan Valášek.


  
