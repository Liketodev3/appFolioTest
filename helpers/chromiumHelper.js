const fs = require('node:fs');

class chromiumHelper{
    getLauncherProfiles(){
        const profiles = [];
        return new Promise(resolve => {
            fs.readFile(userDataDir + '\\Local State', {encoding:'utf8', flag:'r'}, (err, data) => {
                if(err){
                    console.log(err);
                }else{
                    const localState = JSON.parse(data);
                    const profilesInfo = localState?.profile?.info_cache || {};

                    for (const [key, value] of Object.entries(profilesInfo)) {
                        profiles.push({
                            folder: key,
                            name: value.name,
                        });
                    }
                }

                resolve(profiles);
            });
        });
    }
}

module.exports = new chromiumHelper();