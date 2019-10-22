import ItemPrefabCtrl from "./ItemPrefabCtrl";

const { ccclass, property } = cc._decorator;

interface Iterator {
    hasNext(): boolean,
    next(value?: any) : IterationResult,
}

interface IterationResult {
    value: any,
    done: boolean,
}

@ccclass
export default class DirectLoadScrollViewCtrl extends cc.Component {
	@property(cc.ScrollView)
	scrollView: cc.ScrollView = null;

	@property(cc.Prefab)
	itemPrefab: cc.Prefab = null;

	count: number = 0; //每帧创建的数目
	frame: number = 0; //类似于帧数

	//////////////////////////////////////////////////////////////////////////////////////////////////
	// 示例一：直接创建指定数量的子节点

	async directLoad(length: number) {
        this.scrollView.content.removeAllChildren();
	    console.time("direct");
		await new Promise((resolve, reject) => {
			for (let i = 0; i < length; i++) {
				this._initItem(i);
			}
			resolve();
            console.timeEnd("direct");
		});
	}

	//////////////////////////////////////////////////////////////////////////////////////////////////
	// 示例二：分帧创建指定数量的子节点

	async framingLoad(childNodeCount: number) {
		this.scrollView.content.removeAllChildren();
        console.time("framing");
		await this.executePreFrame(this._getItemGenerator(childNodeCount), 10);
        console.timeEnd("framing");
	}

	/**
	 * 分帧执行 Generator 逻辑
	 *
	 * @param generator 生成器
	 * @param duration 持续时间（ms），每次执行 Generator 的操作时，最长可持续执行时长。假设值为8ms，那么表示1帧（总共16ms）下，分出8ms时间给此逻辑执行
	 */
	private executePreFrame(generator: Generator, duration: number) {
		return new Promise((resolve, reject) => {
			let gen = generator;
			// 创建执行函数
			let execute = () => {
				// 执行之前，先记录开始时间
				let startTime = new Date().getTime();

				// 然后一直从 Generator 中获取已经拆分好的代码段出来执行
				for (let iter = gen.next(); ; iter = gen.next()) {
					// 判断是否已经执行完所有 Generator 的小代码段，如果是的话，那么就表示任务完成
					if (iter == null || iter.done) {
						resolve();
						return;
					}

					// 每执行完一段小代码段，都检查一下是否已经超过我们分配的本帧，这些小代码端的最大可执行时间
					if (new Date().getTime() - startTime > duration) {
						// 如果超过了，那么本帧就不在执行，开定时器，让下一帧再执行
						this.scheduleOnce(() => {
							execute();
						});
						return;
					}
				}
			};

			// 运行执行函数
			execute();
		});
	}

	private *_getItemGenerator(length: number) {
		for (let i = 0; i < length; i++) {
			yield this._initItem(i);
		}
	}

    sleep(interval) {
        return new Promise(resolve => {
            setTimeout(resolve, interval);
        })
    }

    async recursionLoad(length: number){
        this.scrollView.content.removeAllChildren();
        console.time("recursion");
        await this.recursion(length);
        console.timeEnd("recursion");
    }

    async recursion(length: number) {
        this._initItem(length);
        await this.sleep(0);
        if(length > 0){
            await this.recursion(length-1);
        }
    }

    async sequenceLoad(length: number) {
        this.scrollView.content.removeAllChildren();
        console.time("sequence");
        for(let i=0;i<length;i++){
            this._initItem(i);
            if(/*i != length-1*/i%10 == 0){ //相当于每次（帧）创建10个
                await this.sleep(0);
            }
        }
        console.timeEnd("sequence");
    }

    async framingLoad2(length: number) {
        this.scrollView.content.removeAllChildren();
        console.time("framing2");
        await this.executeSplitFrame(length);
        console.timeEnd("framing2");
    }

    async executeSplitFrame(length: number){
        let it: Iterator = this.makeItemIt(length);
        while(it.hasNext()){
            await this.runSplitFrame(it, 10);
        }
    }

    makeItemIt(length: number): Iterator{
        let nextIndex = 0;
        let initItem = (index: number) => {
            return this._initItem(index);
        };
        return {
            hasNext: function() {
                return nextIndex < length;
            },
            next: function() {
                return this.hasNext()
                    ? {value: function() {initItem(nextIndex++)}, done: false}
                    : {value: undefined, done: true};
            }
        };
    }

    async runSplitFrame(it: Iterator, duration: number){
        let startTime = new Date().getTime();
        let stop = false;
        do{
            let next = it.next();
            if(next.done){
                return;
            }
            next.value();
            stop = (new Date().getTime() - startTime >= duration);
        }while(!stop);
        await this.sleep(0);
    }

    private _initItem(itemIndex: number) {
	    // console.time("_initItem");
        let itemNode = cc.instantiate(this.itemPrefab);
        itemNode.width = this.scrollView.content.width / 10;
        itemNode.height = itemNode.width;
        itemNode.parent = this.scrollView.content;
        itemNode.setPosition(0, 0);
        itemNode.getComponent(ItemPrefabCtrl).bindData(itemIndex);
        this.count++;
        // console.timeEnd("_initItem");
    }

    reset(){
	    this.count = 0;
	    this.frame = 0;
    }

    update(dt: number){
        this.frame++;
        if(this.count > 0){
            cc.log("frame", this.frame, "count", this.count, "dt", ~~(dt*1000)+"ms");
        }
    }

}
