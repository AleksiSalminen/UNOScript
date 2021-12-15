
const { hub } = require('./levels/hub');
const { graveyard } = require('./levels/graveyard');

module.exports = {
    world: [
        hub,
        graveyard
    ]
};
