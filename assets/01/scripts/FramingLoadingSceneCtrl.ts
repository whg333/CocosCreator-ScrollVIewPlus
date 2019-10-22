import ScrollViewCtrl from "./ScrollViewCtrl";
import LoadingDialog from "../../prefabs/LoadingDialog";

const { ccclass, property } = cc._decorator;

@ccclass
export default class FramingLoadingSceneCtrl extends cc.Component {
	@property(LoadingDialog)
	loadingDialog: LoadingDialog = null;

	@property(ScrollViewCtrl)
	scrollViewCtrl: ScrollViewCtrl = null;

	@property({
		type: cc.EditBox,
		tooltip: "输入需要创建的节点数量"
	})
	childNodeCountEditBox: cc.EditBox = null;

	onLoad() {
		this.loadingDialog.hide();
	}

	async onDirectLoadBtnClick() {
		this.loadingDialog.show();
        this.scrollViewCtrl.reset();
		await this.scrollViewCtrl.directLoad(Number.parseInt(this.childNodeCountEditBox.string));
        this.scrollViewCtrl.reset();
		this.loadingDialog.hide();
	}

	async onFramingLoadBtnClick() {
		this.loadingDialog.show();
        this.scrollViewCtrl.reset();
		await this.scrollViewCtrl.framingLoad(Number.parseInt(this.childNodeCountEditBox.string));
        this.scrollViewCtrl.reset();
		this.loadingDialog.hide();
	}

    async onRecursionLoadBtnClick() {
        this.loadingDialog.show();
        this.scrollViewCtrl.reset();
        await this.scrollViewCtrl.recursionLoad(Number.parseInt(this.childNodeCountEditBox.string));
        this.scrollViewCtrl.reset();
        this.loadingDialog.hide();
    }

    async onSequenceLoadBtnClick() {
        this.loadingDialog.show();
        this.scrollViewCtrl.reset();
        //await this.scrollViewCtrl.sequenceLoad(Number.parseInt(this.childNodeCountEditBox.string));
        await this.scrollViewCtrl.framingLoad2(Number.parseInt(this.childNodeCountEditBox.string));
        this.scrollViewCtrl.reset();
        this.loadingDialog.hide();
    }

}
