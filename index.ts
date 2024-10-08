import { JSDOM } from 'jsdom';
import readline from 'readline';

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let endpoint: string = 'https://www.ecs.soton.ac.uk/people/';

function getId() {
    return new Promise(function (resolve, reject) {
        rl.question("Please provide the ID of the person you wish to find the name of: ", (answer: string) => {
            if (answer.trim() == '') {
                reject();
            }

            resolve(answer)
        })
    })
}

(async function () {
    let id;
    let validInput = false;

    // Get some sort of ID (any text)
    while (!validInput) {
        try {
            id = await getId();
            validInput = true;
        } catch (error) {
            console.log('Please provide a valid input!');
        }
    }
    rl.close();

    const pageResponse: Response = await fetch(`${endpoint}${id}`);

    // Check the request was successful
    if (pageResponse.status !== 200) {
        console.log('Cannot access records at this time.');
        return;
    }

    // Ensure we recieve HTML and not another format
    if (pageResponse.headers.get('Content-Type') != 'text/html; charset=UTF-8') {
        console.log('Cannot access records at this time.')
        return;
    }

    // Extract the HTML from the response and create a document object
    const pageContent: string = await pageResponse.text();
    const doc: JSDOM = new JSDOM(pageContent);

    // Get the JSON with the necessary data if it exists
    const dataText = doc.window.document.querySelectorAll('script[type="application/ld+json"]')[0]?.textContent;
    if (dataText == null) {
        console.log('Cannot access records for this person.');
        return;
    }

    // Process the data and find a record where the type is a person. Output the name of this person.
    const dataJSON = JSON.parse(dataText);
    const { name } = dataJSON['@graph'].filter((dataObject: { '@type'?: string, 'name'?: string }) => dataObject['@type'] === "Person")[0];
    console.log({ name });
})();