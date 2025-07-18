module.exports = {
    apps : [{
        name   : "fydne.dev",
        script : "./init.js",
        out_file: "/dev/null",
        error_file: "/dev/null",
        exec_mode : "cluster",
        max_memory_restart: "125M"
    }]
}