import { getExplorers } from "./lib/wiki-helpers";

console.log(JSON.stringify(await getExplorers(), null, 4));
