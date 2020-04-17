addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})
/**
 * Respond with hello worker text
 * @param {Request} request
 */

async function handleRequest(request) {

  await fetch('https://cfw-takehome.developers.workers.dev/api/variants')
  .then((response) => {
    return response.json();
  })
  .then((data) => {
    url_list = data['variants'];
  });

  /**
   * check if request has a cookie that assigns the variant
   * if not, use Math.random() and the bound will be 0.5
   * if < 0.5 then first url, else second url
   */
  let idx = 0
  let first = true

  const cookie = request.headers.get('cookie')
  if (cookie && cookie.includes(`tqz=0`)) {
    idx = 0
    first = false
  } else if (cookie && cookie.includes(`tqz=1`)) {
    idx = 1
    first = false
  } else {
    idx = Math.random() < 0.5 ? 0 : 1
  }

  const init = {
    headers: {
      'content-type': 'text/html;charset=UTF-8',
    },
  }

  let response = await fetch(url_list[idx], init)

  if (first) {
    response = new Response(response.body, response)
    response.headers.set('Set-Cookie', `tqz=${idx}`)
  }

  return new HTMLRewriter()
  .on('title', new ElementHandler(idx))
  .on('h1#title', new ElementHandler(idx))
  .on('p#description', new ElementHandler(idx))
  .on('a#url', new ElementHandler(idx))
  .transform(response)
  //return new Response(results, init)
}

/**
 * Elementhandler will be used to modify the HTML elements
 * 
 */
class ElementHandler {
  constructor(index) {
    this.index = index
  }
  element(element) {
    switch (element.tagName) {
      case 'title':
        if (this.index) {
          element.setInnerContent("Title of Variant 2 changed!")
        } else {
          element.setInnerContent("Title of Variant 1 changed!")
        }
        break;
      
      case 'h1':
        if (this.index) {
          element.setInnerContent("This is new header for Variant 2!")
        } else {
          element.setInnerContent("I gave Variant 1 a new header!")
        }
        break;

      case 'p':
        element.setInnerContent("you have been assigned cookie 'tqz' that always displays variant " + String(this.index + 1))
        break;

      case 'a':
        element.setInnerContent("Here's my personal page")
        element.setAttribute("href", "https://zhangtia.github.io/")
        break;
    
      default:
        console.log(element.tagName)
        console.log("ERROR - DEFAULT CASE REACHED")
        break;
    }
  }
}
