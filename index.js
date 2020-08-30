require("babel-core/register");
require("babel-polyfill");
const fs = require("fs");
let rawdata = fs.readFileSync("articles.json");
let data = JSON.parse(rawdata);
import fetch from "node-fetch";

const config = {
  domain: "__domain__",
  email: "__email__/token",
  apiKey: "__token__",
  generalCategoriesId: '__generalCategoriesId__',
  permissionGroupId: __permissionGroupId__
};


function keyGenerate() {
  return Buffer.from(`${config.email}:${config.apiKey}`).toString("base64");
}

async function createSection(item) {
  var raw = JSON.stringify({
    section: {
      "translations":
        [{
          "locale": "tr",
          "title": item['tr'],
        },
        {
          "locale": "en-001",
          "title": item['en-001'],
        }]
    },
  });
  const response = await fetch(
    `https://${config.domain}.zendesk.com/api/v2/help_center/categories/${config.generalCategoriesId}/sections.json`,
    {
      method: "post",
      headers: {
        Authorization: "Basic " + keyGenerate(),
        "Content-Type": "application/json",
      },
      body: raw,
    }
  );
  return response;
}

async function createArticle(article, sectionId) {
  var raw = JSON.stringify({
    "article": {
      "translations": article,
      "user_segment_id": null,
      "permission_group_id": config.permissionGroupId
    },
    "notify_subscribers": false
  });
  const response = await fetch(
    `https://${config.domain}.zendesk.com/api/v2/help_center/sections/${sectionId}/articles.json`,
    {
      method: "post",
      headers: {
        Authorization: "Basic " + keyGenerate(),
        "Content-Type": "application/json",
      },
      body: raw,
    }
  );
  return response;
}


async function deleteSection(title, body, locale) {
  const response = await fetch(
    `https://${config.domain}.zendesk.com/api/v2/help_center/sections.json`,
    {
      method: "get",
      headers: {
        Authorization: "Basic " + keyGenerate(),
        "Content-Type": "application/json",
      },
    }
  );
  let data = await response.json();

  let promise = data.sections.map(async (item, i) => {
    await setTimeout(async () => {
      const response = await fetch(
        `https://${config.domain}.zendesk.com/api/v2/help_center/sections/${item.id}.json`,
        {
          method: "delete",
          headers: {
            Authorization: "Basic " + keyGenerate(config),
            "Content-Type": "application/json",
          },
        }
      );
      console.log(response.status);
    }, 1000 + 1000 * i);
  });

  Promise.all(promise).then(() => console.log("done"));

  return response;
}

/* deleteSection();  */

const allPromise = data.map(
  async (item, i) =>
    await setTimeout(async () => {
      let section = await (await createSection(item)).json();
      const articlePromise = item.articles.map(
        async (article, aIndex) =>
          await setTimeout(async () => {
            let b = await createArticle(article,
              section.section.id
            );
            console.log(b.status);
          }, ((i + 1) * 4500 * (aIndex + 1)))
      )
      Promise.all(articlePromise)
    }, 5000 + i * 1000)
)

Promise.all(allPromise)

