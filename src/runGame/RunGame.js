//游戏主文件,入口文件
(function () {
    /**
     * 游戏入口
     */
    function RunGame() {

        this.bg = null;
        this.mapFloor = null;
        this.player = null;

        this.hpEnergy = null;
        this.speedEnergy = null;

        this.score = 0;

        RunGame.__super.call(this);

        this.init();
    }

    //RunGame 是一个显示对象 继承此 Sprite 注册这个RunGame类
    Laya.class(RunGame, "RunGame", Sprite);

    //定义RumGame的原型
    var _proto = RunGame.prototype;

    //初始化
    _proto.init = function () {
        //添加背景
        this.bg = new BackGround();
        this.addChild(this.bg);

        //添加地板
        this.mapFloor = new MapFloor();
        this.addChild(this.mapFloor);

        //无敌能量条
        this.Invincible = new EnergyBar(EnergyBar.TYPE_INVINCIBLE);
        this.Invincible.y = 7;
        this.addChild(this.Invincible);

        //减速能量条
        this.Deceleration = new EnergyBar(EnergyBar.TYPE_DECELERATION);
        this.Deceleration.y = 7;
        this.Deceleration.x = this.Invincible.width + 10;
        this.addChild(this.Deceleration);

        //分数
        this.scoreText = new Text();
        this.scoreText.color = SCORETEXT_COLOR;
        this.scoreText.fontSize = SCORETEXT_FONT_SIZE;
        this.scoreText.text = SCORETEXT_TEXT_DEFAULT;
        this.scoreText.width = BG_WIDTH;
        this.scoreText.align = SCORETEXT_ALIGN;
        this.scoreText.x = -10;
        this.scoreText.y = 10;
        this.addChild(this.scoreText);

        //添加主角
        this.player = new Player(this.Invincible,this.Deceleration);
        this.addChild(this.player);

        //监听鼠标按下弹起事件
        Laya.stage.on(laya.events.Event.MOUSE_DOWN, this, this.onMouseDown)

        //创建帧循环处理函数
        Laya.timer.frameLoop(1, this, this.onLoop);
    }

    _proto.onLoop = function () {       
        //获取所有的地板
        for (var i = this.mapFloor.numChildren - 1; i > - 1; i--) {
            var floor = this.mapFloor.getChildAt(i);
            //判断玩家是否踩在了地板上,已经踩在地板上就可以终止判断了
            if (!this.player.isOnFloor) {
                //检测主角是否踩在地板上
                if (floor.checkHit(this.player.x, this.player.y, this.player.status)) {
                    //人物如果踩到地板了 就把人物的坐标设置到地板上面
                    if (this.player.status == "up") {
                        this.player.isStopDown = true;//停止下落
                        this.player.y = (BG_HEIGHT - FLOOR_HEIGHT) / 2 - PLAYER_HEIGHT + 30;
                        // this.player.y -= 128;
                        this.bg.cat.pos(BG_WIDTH * 1.2, this.player.y - 30);
                        this.player.isOnFloor = true;
                    } else if (this.player.status == "down") { }
                }
            }
            //检测是否碰到道具了
            var itemList = floor.getAllItems();
            for(var j = 0;j < itemList.length;j++){
                var item = itemList[j];
                //只有显示的物品才做碰撞检测
                if(item.visible ){
                    //拿到物品的位置信息
                    if(this.player.hitCheck(this.player.body.x,this.player.y,item.x + floor.x - PLAYER_WIDTH,item.y,item.directionStatus,item.type,this.player.status)){
                        //物品有多个类型 分类型进行判断
                        if(item.type == Item.ITEM_TYPE_DECELERATION){
                            item.visible = false;
                            this.player.decelerationEnergy.addEnergyValue(20);
                            if(this.player.decelerationEnergy.value == 100){
                                //减速


                            }
                        }else if(item.type == Item.ITEM_TYPE_INCINCIBLE){
                            item.visible = false;
                            this.player.invincibleEnergy.addEnergyValue(20);
                            if(this.player.invincibleEnergy.value == 100 && !this.player.isInEffect){
                                //无敌
                                
                                this.player.showEffect();}
                            
                        }else{
                            this.scoreText.text ++ ;
                            //星星物品播放动画
                            item.TweenStar(item);
                        }
                        
                    }
                }
            }
        }
        
    }
    //鼠标按下事件
    _proto.onMouseDown = function () {
        //在下落过程中不允许翻转
        if (!this.player.isOnFloor) { return; }

        this.player.flip();
        //不知道为何,在Player里面设置XY一直不成功,所以改在这里设置
        // console.log("玩家状态:" + this.player.status + "  玩家Y轴位置:" + this.player.y);
        if (this.player.status == "up") { this.player.y = (BG_HEIGHT - FLOOR_HEIGHT) / 2 - PLAYER_HEIGHT + 30 }
        else if (this.player.status == "down") { this.player.y = ((BG_HEIGHT + FLOOR_HEIGHT) / 2) + PLAYER_HEIGHT - 15 }
    }
})();