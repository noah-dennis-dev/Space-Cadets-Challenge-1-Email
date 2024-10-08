"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const jsdom_1 = require("jsdom");
const readline_1 = __importDefault(require("readline"));
const rl = readline_1.default.createInterface({
    input: process.stdin,
    output: process.stdout
});
let endpoint = 'https://www.ecs.soton.ac.uk/people/';
function getId() {
    return new Promise(function (resolve, reject) {
        rl.question("Please provide the ID of the person you wish to find the name of: ", (answer) => {
            if (answer.trim() == '') {
                reject();
            }
            resolve(answer);
        });
    });
}
(function () {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        let id;
        let validInput = false;
        // Get some sort of ID (any text)
        while (!validInput) {
            try {
                id = yield getId();
                validInput = true;
            }
            catch (error) {
                console.log('Please provide a valid input!');
            }
        }
        rl.close();
        const pageResponse = yield fetch(`${endpoint}${id}`);
        // Check the request was successful
        if (pageResponse.status !== 200) {
            console.log('Cannot access records at this time.');
            return;
        }
        // Ensure we recieve HTML and not another format
        if (pageResponse.headers.get('Content-Type') != 'text/html; charset=UTF-8') {
            console.log('Cannot access records at this time.');
            return;
        }
        // Extract the HTML from the response and create a document object
        const pageContent = yield pageResponse.text();
        const doc = new jsdom_1.JSDOM(pageContent);
        // Get the JSON with the necessary data if it exists
        const dataText = (_a = doc.window.document.querySelectorAll('script[type="application/ld+json"]')[0]) === null || _a === void 0 ? void 0 : _a.textContent;
        if (dataText == null) {
            console.log('Cannot access records for this person.');
            return;
        }
        // Process the data and find a record where the type is a person. Output the name of this person.
        const dataJSON = JSON.parse(dataText);
        const { name } = dataJSON['@graph'].filter((dataObject) => dataObject['@type'] === "Person")[0];
        console.log({ name });
    });
})();
