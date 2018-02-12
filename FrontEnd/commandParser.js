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
            command.cmdStrings.forEach((cmdOption) => {
                if (!matchFlag) {
                    if (cmdOption.search('%?%') != -1) {
                        cmdOption = cmdOption.split('%?%');
                        if (str.indexOf(cmdOption[0]) != -1 && str.indexOf(cmdOption[1]) != -1) {
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
                        }
                    }
                }
            })
        }
    });
    this.commandList.commands.forEach((command, index) => {
        if (!matchFlag) {
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