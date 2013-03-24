GoogDriveFixtures = {file_list: {}, parent_list: {}};
GoogDriveFixtures.file_list.root = {
    "kind": "drive#fileList",
    "items": [
        {
            "id": "abc1",
            "title": "PC010005.ORF",
            "mimeType": "image/x-olympus-orf"
        },
        {
            "id": "abc2",
            "title": "PC010003.ORF",
            "mimeType": "image/x-olympus-orf"
        },
        {
            "id": "abc3",
            "title": "Photo 2013-02-28 01.16.26 午後.png",
            "mimeType": "image/png"
        },
        {
            "id": "abc4",
            "title": "Photo 2013-02-26 09.58.42 午前.jpg",
            "mimeType": "image/jpeg",
            "imageMediaMetadata": {
                "date": "2012:12:09 09:13:50"
            }
        },
        {
            "id": "abc5",
            "title": "Team",
            "mimeType": "application/vnd.google-apps.spreadsheet"
        },
        {
            "id": "abc6",
            "title": "Resume.docx",
            "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        },
        {
            "id": "abc7",
            "title": "Untitled drawing",
            "mimeType": "application/vnd.google-apps.drawing"
        },
        {
            "id": "abc1Folder1",
            "title": "TENTO",
            "mimeType": "application/vnd.google-apps.folder"
        },
        {
            "id": "abc1Folder2",
            "title": "Visa",
            "mimeType": "application/vnd.google-apps.folder"
        },
        {
            "id": "abc8",
            "title": "TENTO",
            "mimeType": "application/vnd.google-apps.spreadsheet"
        }
    ]
};

GoogDriveFixtures.file_list.abc1Folder1 = {
    "kind": "drive#fileList",
    "items": [
        {
            "id": "azzz1",
            "title": "TENTO file 11",
            "mimeType": "application/vnd.google-apps.document"
        },
        {
            "id": "azzz2",
            "title": "TENTO file 12",
            "mimeType": "application/vnd.google-apps.document"
        }
    ]
};

GoogDriveFixtures.file_list.abc1Folder2 = {
    "kind": "drive#fileList",
    "items": [
    {
        "id": "asdf1",
        "title": "Itinerary_boris",
        "mimeType": "application/vnd.google-apps.document"
    },
    {
        "id": "asdf2",
        "title": "Invitatioin Letter_Alex and Yulia.doc",
        "mimeType": "application/vnd.google-apps.document"
    },
    {
        "id": "asdf2Folder01",
        "title": "Visa Subfolder",
        "mimeType": "application/vnd.google-apps.folder"
    },
    {
        "id": "asdf2Folder02",
        "title": "Visa Another Subfolder",
        "mimeType": "application/vnd.google-apps.folder"
    },
{
        "id": "asdf3",
        "title": "Guarantee_Alex",
        "mimeType": "application/vnd.google-apps.document"
    }
]
};

GoogDriveFixtures.file_list.asdf2Folder01 = {
    "kind": "drive#fileList",
    "items": [
    {
        "id": "ssasdf1",
        "title": "File under Visa Subfolder",
        "mimeType": "application/vnd.google-apps.document"
    },
    {
        "id": "ssasdf2",
        "title": "Visa Subfolder about.doc",
        "mimeType": "application/vnd.google-apps.document"
    },
    {
        "id": "ssasdf3",
        "title": "Guarantee_Alex",
        "mimeType": "application/vnd.google-apps.document"
    },
    {
        "id": "asdf3aFolder01",
        "title": "Visa Sub Subfolder With No files",
        "mimeType": "application/vnd.google-apps.folder"
    }
]
};




GoogDriveFixtures.parent_list.asdf3aFolder01 = {
    items: [
        {
            id: "asdf2Folder01",
            isRoot: false
        }
    ]
};

GoogDriveFixtures.parent_list.asdf2Folder01 = {
    items: [
        {
            id: "abc1Folder2",
            isRoot: false
        }
    ]
};

GoogDriveFixtures.parent_list.asdf2Folder02 = {
    items: [
        {
            id: "abc1Folder2",
            isRoot: false
        }
    ]
};

GoogDriveFixtures.parent_list.abc1Folder2 = {
    items: [
        {
            id: "real_root",
            isRoot: true
        }
    ]
};

