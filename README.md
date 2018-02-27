# tldrhelper
A script helping the awesome folks at r/tldr

**tldrhelper** is an userscript that allows users posting on [r/tldr](https://www.reddit.com/r/tldr/) to bookmark and manage Reddit links without leaving the website, automatically formatting the final post.

Special thanks to [/u/kaunis](https://www.reddit.com/user/kaunis) for testing this and giving me feedback.
## Features
* **Autofill and autoformat**: You just need to focus on deciding the best content. I'll handle the boring stuff for you :)
* **Subreddit grouping and sorting**: Posts are grouped automatically by subreddit. Use the arrows in the popup to decide the order that you wish the subs to be displayed. This order will be stored on disk and remembered even if you remove your posts. Just do it once!
* **Reddit CSS**: The UI elements are created following the CSS rules in the Reddit website, so that your user experience is left untouched when surfing Reddit.
* **Never leave Reddit**: You save time, we all get better content!
## FAQ
#### Q: Where do I start?
**A**: To use this script, you need a WebExtension that manages userscripts, such as Violentmonkey, Tampermonkey or GreaseMonkey. Once you have installed your favourite userscript manager, copy the [source code of the script](https://github.com/ElectricBlueSnake/tldrhelper) into a new userscript and you are ready to go.
#### Q: How do I save posts?
**A**: You'll find a "save tldr" link under each Reddit post. Click this to save/unsave the post.
![](https://github.com/ElectricBlueSnake/tldrhelper/blob/master/Images/save.png)
#### Q: How do I save subreddits?
**A**: Toggle the "save sub" button in the sidebar of the subreddit you want to save.
![](https://github.com/ElectricBlueSnake/tldrhelper/blob/master/Images/home.png)
#### Q: Where can I see my saved posts?
**A**: Click the "manage tldr" button in the sidebar. This will open a popup that allows you to sort and remove submissions.
#### Q: How do I decide the subreddit of the day?
**A**: Inside the popup, you'll find a selector in the bottom right corner that will display all the subreddits that you have saved using the dedicated button.
![](https://github.com/ElectricBlueSnake/tldrhelper/blob/master/Images/popup.png)
#### Q: I'm ready to post. What now?
**A**: Just post! The script will fill automatically the body section when posting on a tldr subreddit. If you want to preview the post, I suggest [posting on r/tldrhelper](https://www.reddit.com/r/tldrhelper/submit?selftext=true)
![](https://github.com/ElectricBlueSnake/tldrhelper/blob/master/Images/autofill.png)
#### Q: Something is wrong / I have a suggestion. How do I contact you?
**A**: Feel free to submit a new issue here on the Github repo, otherwise just drop a message to my [Reddit account](https://www.reddit.com/user/nov4chip/)

## Changelog
* **v0.2.0**
  * Saving posts now performs a call to Reddit API, fixing a bug where comments link where not retrieved for final formatting. 
  * Buttons are now created before the page finishes loading.
  * Added post count in the popup.
  * Fixed windows sizes, small others visual tweaks.
  * Saved some characters when formatting by removing redundant information.
* **v0.1.0**
  * Save post and subreddit of the day feature.
  * Management of posts with the popup.
  * Autofill of the body area when posting in a r/tldr* subreddit


