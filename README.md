# iBall

- **An interactive basketball game watching system.**
- **A web-based testbed for embedded visualization research.**
- **[🌟 Live Demo 🌟](https://asportsv.github.io/iBall/)  (only works on Desktop Chrome / Edge)**

![fig_dataVis](https://user-images.githubusercontent.com/3315274/224772074-8a41c5e8-f811-41a0-998d-0b558d65c8df.jpg)


> [**iBall: Augmenting Basketball Videos with Gaze-moderated Embedded Visualizations**](http://128.84.21.203/abs/2303.03476)
> 
> Chen Zhu-Tian, Qisen Yang, Jiarui Shan, Tica Lin, Johanna Beyer, Haijun Xia, and Hanspeter Pfister
> 
> _ACM Conference on Human Factors in Computing Systems, 2023_
>
> [[Paper](http://128.84.21.203/abs/2303.03476) | [Demo](https://asportsv.github.io/iBall/) | [Video](https://vimeo.com/805270302)]


## Abstract
We present iBall, a basketball video-watching system that leverages gaze-moderated embedded visualizations to facilitate game understanding and engagement of casual fans. Video broadcasting and online video platforms make watching basketball games increasingly accessible. Yet, for new or casual fans, watching basketball videos is often confusing due to their limited basketball knowledge and the lack of accessible, on-demand information to resolve their confusion. To assist casual fans in watching basketball videos, we compared the game-watching behaviors of casual and die-hard fans in a formative study and developed iBall based on the findings. iBall embeds visualizations into basketball videos using a computer vision pipeline, and automatically adapts the visualizations based on the game context and users’ gaze, helping casual fans appreciate basketball games without being overwhelmed. We confirmed the usefulness, usability, and engagement of iBall in a study with 16 casual fans, and further collected feedback from 8 die-hard fans.

## Install
1. install `yarn`
2. `yarn`
3. `yarn start` to run this application

## ToDo
- [ ] Improve the user interface:
    - [ ] Select different games
    - [ ] Legend
- [ ] Release the gaze component
- [ ] Release the 2nd game data
- [ ] Release the CV pipeline
- [ ] Better document the code

## Citation
```
@CONFERENCE {chen2023iball,
    title={iBall: Augmenting Basketball Videos with Gaze-moderated Embedded Visualizations},
    author={Chen Zhu-Tian and Qisen Yang and Jiarui Shan and Tica Lin and Johanna Beyer and Haijun Xia and Hanspeter Pfister},
    booktitle={Proceedings of the CHI Conference on Human Factors in Computing Systems},
    year={2023},
    month={apr},
    publisher={ACM}
}
```
