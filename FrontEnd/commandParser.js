function CommandParser(commandList) {
    this.commandList = commandList;
}

CommandParser.prototype.getCommandForString = function(str) {
    str = str.toLowerCase();
    let matchFlag = false;
    returnParams = {
        commandIndex: -1,
        param: undefined
    };
    this.commandList.commands.forEach((command, index) => {
        if (!matchFlag) {
            // iterate through each command option in string
            // if list is empty, will exit here
            command.cmdStrings.forEach((cmdOption) => {
                if (!matchFlag) {
                    if (cmdOption.indexOf('%?%') !== -1 && cmdOption.indexOf('%$%') !== -1) {
                        // FIX
                        // split up constant parts of the command so that we have constant part [a,b,c]
                        let paramLocationPrimary = true; // param is either in primary location (bwtn a and b) or secondary (bwtn b and c)
                        if (cmdOption.indexOf('%?%') < cmdOption.indexOf('%$%')) {
                            cmdOption = cmdOption.split('%?%');
                            let tempStringPieces = cmdOption[1].split('%$%');
                            cmdOption[1] = tempStringPieces[0];
                            cmdOption[2] = tempStringPieces[1];
                        } else {
                            paramLocationPrimary = false;
                            cmdOption = cmdOption.split('%$%');
                            let tempStringPieces = cmdOption[1].split('%?%');
                            cmdOption[1] = tempStringPieces[0];
                            cmdOption[2] = tempStringPieces[1];
                        }
                        // split apart cmdOption pieces to ensure are in the right order
                        let indexes = [];
                        indexes[0] = str.indexOf(cmdOption[0]);
                        indexes[1] = str.indexOf(cmdOption[1]);
                        // if indexes[1] is "", should be bwtn indexes[0] and indexes[2] always
                        // i.e. indexes[0] < indexes[1] and indexes[1] < indexes[2] shouldn't eval false based on indexes[1]
                        indexes[1] = indexes[1] == "" ? indexes[0] + 1 : indexes[1];
                        indexes[2] = str.indexOf(cmdOption[2]);
                        // if indexes[2] is "", should be bwtn > indexes[1] always
                        // i.e. indexes[1] < indexes[2] shouldn't eval false based on indexes[2]
                        indexes[2] = indexes[2] == "" ? str.length : indexes[2];
                        
                        if (indexes[0] !== -1 && indexes[0] < indexes[1] && indexes[1] < indexes[2]) {
                            matchFlag = true;
                            returnParams.commandIndex = index;
                            if (paramLocationPrimary) {
                                returnParams.param = str.substring(indexes[0] + cmdOption[0].length, indexes[1]);
                            } else {
                                console.log(str);
                                console.log(indexes[1]);
                                console.log(cmdOption[1].length);
                                console.log(indexes[2]);
                                console.log(str.substring(indexes[1] + cmdOption[1].length, indexes[2]));
                                returnParams.param = str.substring(indexes[1] + cmdOption[1].length, indexes[2])
                            }
                            
                        }
                    } else if (cmdOption.indexOf('%$%') !== -1) {
                        cmdOption = cmdOption.split('%$%');
                        let indexes = [];
                        indexes[0] = str.indexOf(cmdOption[0]);
                        indexes[1] = str.indexOf(cmdOption[1]);
                        // if end of string is "", set to max because should be end not beginning
                        indexes[1] = indexes[1] == "" ? str.length : indexes[1];
                        if (indexes[0] !== -1 && indexes[0] < indexes[1]) {
                            matchFlag = true;
                            returnParams.commandIndex = index;
                            // no param to return, do not set
                        }
                    } else if (cmdOption.indexOf('%?%') !== -1) {
                        cmdOption = cmdOption.split('%?%');
                        let indexes = [];
                        indexes[0] = str.indexOf(cmdOption[0]);
                        indexes[1] = str.indexOf(cmdOption[1]);
                        // if end of string is "", set to max because should be end not beginning
                        indexes[1] = indexes[1] == "" ? str.length : indexes[1];
                        if (indexes[0] !== -1 && indexes[0] < indexes[1]) {
                            str = str.replace(cmdOption[0], "");
                            str = str.replace(cmdOption[1], "");
                            str = str.trim();
                            matchFlag = true;
                            returnParams.commandIndex = index;
                            returnParams.param = str;
                        }
                    } else {
                        if (str == cmdOption) {
                            matchFlag = true;
                            returnParams.commandIndex = index;
                            // no param to return, do not set
                        }
                    }
                }
            })
        }
    });
    this.commandList.commands.forEach((command, index) => {
        if (!matchFlag) {
            // iterate through each keyword in each command
            // if no keywords specified, will exit here
            command.keywords.forEach((keyword) => {
                if (str.indexOf(keyword) != -1) {
                    matchFlag = true;
                    returnParams.commandIndex = index;
                }
            });
        }
    });
    return returnParams;
}

module.exports = {
    initCommandParser: (cmdList) => {
        return new CommandParser(cmdList);
    } 
}