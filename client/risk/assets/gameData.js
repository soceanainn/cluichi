const leinster = {
    "kildare": {"x": 1010, "y": 980, "troops": null, "owner": null, "neighbours": ["dublin", "meath", "offaly", "laois", "carlow", "wicklow"]},
    "louth": {"x": 1130, "y": 700, "troops": null, "owner": null, "neighbours": ["meath", "monaghan", "armagh"]},
    "meath": {"x": 1040, "y": 800, "troops": null, "owner": null, "neighbours": ["louth", "monaghan", "cavan", "longford", "westmeath", "kildare", "dublin"]},
    "wexford": {"x": 1060, "y": 1300, "troops": null, "owner": null, "neighbours": ["waterford", "kilkenny", "carlow", "wicklow", "dublin", "cork"]},
    "westmeath": {"x": 880, "y": 850, "troops": null, "owner": null, "neighbours": ["longford","cavan","meath","offaly","roscommon"]},
    "longford": {"x": 790, "y": 770, "troops": null, "owner": null, "neighbours": ["leitrim", "roscommon","westmeath", "cavan"]},
    "offaly": {"x": 790, "y": 980, "troops": null, "owner": null, "neighbours": ["galway", "tipperary", "laois", "kildare", "meath", "westmeath", "longford", "roscommon"]},
    "laois": {"x": 880, "y": 1060, "troops": null, "owner": null, "neighbours": ["kildare", "carlow", "kilkenny", "tipperary", "offaly"]},
    "kilkenny": {"x": 920, "y": 1250, "troops": null, "owner": null, "neighbours": ["laois", "carlow", "wexford", "waterford", "tipperary"]},
    "wicklow": {"x": 1130, "y": 1060, "troops": null, "owner": null, "neighbours": ["dublin", "kildare", "carlow", "wexford"]},
    "carlow": {"x": 1010, "y": 1150, "troops": null, "owner": null, "neighbours": ["kildare", "laois", "kilkenny", "wexford", "wicklow"]},
    "dublin": {"x": 1150, "y": 910, "troops": null, "owner": null, "neighbours": ["meath", "kildare","wicklow", "antrim"]}
};

const munster = {
    "cork": {"x": 550, "y": 1480, "troops": null, "owner": null, "neighbours": ["dublin", "galway", "kerry", "limerick", "tipperary", "waterford"]},
    "limerick": {"x": 540, "y": 1260, "troops": null, "owner": null, "neighbours": ["clare", "tipperary","cork","kerry"]},
    "clare": {"x": 470, "y": 1130, "troops": null, "owner": null, "neighbours": ["galway", "tipperary", "limerick"]},
    "tipperary": {"x": 750, "y": 1250, "troops": null, "owner": null, "neighbours": ["offaly", "laois", "kilkenny", "waterford", "cork", "limerick", "clare", "galway"]},
    "waterford": {"x": 820, "y": 1400, "troops": null, "owner": null, "neighbours": ["cork", "tipperary", "kilkenny", "wexford"]},
    "kerry": {"x": 360, "y": 1400, "troops": null, "owner": null, "neighbours": ["limerick", "cork"]}
};

const connaught = {
    "mayo": {"x": 450, "y": 700, "troops": null, "owner": null, "neighbours": ["sligo", "roscommon", "galway"]},
    "leitrim": {"x": 750, "y": 630, "troops": null, "owner": null, "neighbours": ["donegal", "fermanagh", "cavan", "longford", "sligo", "roscommon"]},
    "sligo": {"x": 570, "y": 580, "troops": null, "owner": null, "neighbours": ["leitrim", "roscommon", "sligo"]},
    "roscommon": {"x": 650, "y": 725, "troops": null, "owner": null, "neighbours": ["leitrim", "longford", "westmeath", "offaly", "galway", "mayo", "sligo"]},
    "galway": {"x": 570, "y": 900, "troops": null, "owner": null, "neighbours": ["mayo", "roscommon", "offaly", "tipperary", "clare", "donegal", "cork"]}
};

const ulster = {
    "donegal": {"x": 720, "y": 300, "troops": null, "owner": null, "neighbours": ["derry", "tyrone", "fermanagh", "leitrim", "galway", "antrim"]},
    "fermanagh": {"x": 800, "y": 500, "troops": null, "owner": null, "neighbours": ["donegal", "tyrone", "monaghan", "cavan", "leitrim"]},
    "tyrone": {"x": 930, "y": 400, "troops": null, "owner": null, "neighbours": ["donegal", "derry", "armagh", "monaghan", "fermanagh"]},
    "derry": {"x": 1000, "y": 250, "troops": null, "owner": null, "neighbours": ["donegal", "tyrone", "antrim"]},
    "antrim": {"x": 1165, "y": 300, "troops": null, "owner": null, "neighbours": ["derry", "down", "dublin", "donegal"]},
    "down": {"x": 1200, "y": 500, "troops": null, "owner": null, "neighbours": ["antrim", "armagh"]},
    "armagh": {"x": 1070, "y": 530, "troops": null, "owner": null, "neighbours": ["down", "antrim", "louth", "monaghan", "tyrone"]},
    "monaghan": {"x": 970, "y": 580, "troops": null, "owner": null, "neighbours": ["tyrone", "armagh", "louth", "meath", "cavan", "fermanagh"]},
    "cavan": {"x": 900, "y": 680, "troops": null, "owner": null, "neighbours": ["monaghan", "meath", "westmeath", "longford", "leitrim", "fermanagh"]}
};

const harbours = [
    {"x": 1250, "y": 170},
    {"x": 1150, "y": 1270},
    {"x": 600, "y": 1630},
    {"x": 200, "y": 950},
    {"x": 500, "y": 200},
    {"x": 1220, "y": 870}
];
