const grants = {
    avenger: {
        ice_cream: {
            "create:any": ["*"],
            "read:any": ['*'],
            "update:any": ["*"],
        }
    },
    enemy: {
        ice_cream: {
            "read:any": ["*"],
        }
    }
};

const roles = {
    avenger: [
        "@tstark",
        "@thor"
    ],
    enemy: [
        "@thanos",
        "@ultron"
    ]
}

export {
    grants,
    roles
}
