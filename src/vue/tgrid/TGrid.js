export default {
    props : {
        gridInfo : Object,
        columns : Array,
        data: Array
    },
    data: function () {
        return {
            gridStyle : null,
            titleStyle: null,
            sortKey: '',
            sortOrders: null,
            columnType: null,
            gridWidth: 0,
            selected: [],
            dragTargetPos:null,
            dragTarget : null
        };
    },
    computed: {

        selectAll: {
            get() {
                return this.data.every(function(d){
                    return d.checked;
                });
            },
            set() {

            }
        },

        gridOptions() {
            return Object.assign({
                title     : null,
                titleAlign: 'center',
                width     : '100%',
                height    : '100%'
            }, this.gridInfo);
        },

        columnOptions:{
            get() {
                let defColumns = [];
                for (let ix = 0, ixLen = this.columns.length; ix < ixLen; ix++) {
                    defColumns[ix] = Object.assign({
                        dataIndex: 'def_dataIndex_' + ix,
                        name: '',
                        width: 50,
                        visible: false,
                        draggable: false,
                        type: ''
                    }, this.columns[ix]);
                }
                return defColumns;
            },
            set(data) {
                
                //드래그 드랍 이벤트 값변경시 탑니다
                if(data.type === 'drag') {
                    this.columns.splice(data.dragIdx, 1);
                    this.columns.splice(data.dropIdx, 0, data.targetCol);
                }
            }
        },

        gridTotalWidth() {
            let totalWidth = this.gridWidth;
            this.columns.forEach(function(column) {
                totalWidth += column.width;
            });

            return totalWidth;
        },

        sortedData: function () {
            let sortKey = this.sortKey;

            let order = this.sortOrders[sortKey] || 1;
            let sortedData = this.data;

            if (sortKey) {
                sortedData = sortedData.slice().sort(function (a, b) {
                    a = a[sortKey];
                    b = b[sortKey];
                    return (a === b ? 0 : a > b ? 1 : -1) * order;
                });
            }

            return sortedData;
        }
    },
    methods: {

        cellClick: function(columnData, colIdx, rowData, rowIdx, e) {
            // alert('Col Info -> '+ columnData + '\nCol Idx -> ' + colIdx + '\nRow Info -> '+ rowData + '\nRow Idx -> ' + rowIdx);
        },

        checkBoxClick: function() {
            const selected = this.selected;

            console.log('checkboxClick ==> ', arguments);
        },

        gridBodyScroll: function(e) {
            this.$el.getElementsByTagName('thead')[0].style.left = (-e.target.scrollLeft) + 'px';
            // $('thead').css("left", -$("tbody").scrollLeft()); //fix the thead relative to the body scrolling
            // $('thead th:nth-child(1)').css("left", $("tbody").scrollLeft()); //fix the first cell of the header
            // $('tbody td:nth-child(1)').css("left", $("tbody").scrollLeft()); //fix the first column of tdbody
        },

        toggleSelect: function() {
            let select = this.selectAll;
            this.data.forEach(function(d) {
                d.checked = !select;
            });
            this.selectAll = !select;
        },

        sortBy: function(key) {
            this.sortKey = key;
            this.sortOrders[key] = this.sortOrders[key] * -1;
        },

        cls(type) {
            switch (type) {
                case 'number':
                case 'integer':
                case 'numeric':
                case 'float':
                    return 'text-align-right';
                case 'date':
                case 'datetime':
                    return '';
                case 'checkbox' :
                    return '';
                default:
                    return '';
            }
        },

        setResizeGrips() {
            const vm = this;
            const headerCols = Array.from(vm.$el.getElementsByClassName('grip'));
            headerCols.forEach((grip) => {
                grip.addEventListener('mousedown', this.onMouseDown);
                vm.grips.push(grip);
            });
            document.addEventListener('mousemove', this.onMouseMove);
            document.addEventListener('mouseup', this.onMouseUp);
        },

        syncColumnWidths() {
            const vm = this;
            const headerCols = Array.from(vm.$el.getElementsByTagName('th'));
            const widths = headerCols.map((h) => h.width ? h.width : h.clientWidth);
            // this.columnOptions[1].width = +widths[1];
            const bodyCols = Array.from(vm.$el.querySelectorAll('tr:first-child>td'))
            bodyCols.forEach((c, i) => {
                c.width = widths[i] + 'px';
            });
            console.log(this.columnOptions)
        },

        onMouseDown(e) {
            const vm = this;
            vm.thElm = e.target.parentNode;
            vm.startOffset = vm.thElm.offsetWidth - e.pageX;
            return false;
        },

        onMouseMove(e) {
            const vm = this;
            if (vm.thElm) {
                // const colName = vm.thElm.getAttribute('data-column-name');
                const width = vm.startOffset + e.pageX;
                vm.thElm.width = width;
            }
        },

        onMouseUp() {
            const vm = this;
            vm.thElm = undefined;
            vm.syncColumnWidths();
        },


        /**
         * 드래그 이벤트 세팅
         */
        setDragColumnEvent() {
            var columns = document.querySelectorAll('.grid-column-sort');
            const vm = this;

            for(let ix=0, ixLen=columns.length; ix<ixLen; ix++){

                columns[ix].addEventListener('dragstart', handleDragStart, false);

                columns[ix].addEventListener('dragenter', handleDragEnter, false);
                columns[ix].addEventListener('dragover', handleDragOver, false);
                columns[ix].addEventListener('drop', handleDragDrop, false);
                columns[ix].addEventListener('dragend', handleDragEnd, false);
                // columns[ix].addEventListener('dragleave', handleDragLeave, false);

            }


            //드래그 시작시
            function handleDragStart(e) {
                this.style.opacity = '0.4';
                this.classList.add('dragItem')

                vm.dragTargetPos = this.parentElement.getBoundingClientRect();
                vm.dragTarget = this;
            }

            //드래그가 타겟 엔터시
            function handleDragEnter(e) {

                const targetEl = e.target;

                if(this.classList.contains('grid-column-sort') && !this.classList.contains('dragItem')){
                    let targetPos = this.parentElement.getBoundingClientRect();
                    let dragX = (targetPos.left) + 'px';
                    let dragY = (targetPos.top) + 'px';

                    //드래그 타겟보다 오른쪽컬럼들
                    if(vm.dragTargetPos.left < targetPos.left){
                        dragX = (targetPos.right) + 'px';
                    }

                    vm.$refs.dragLine.style.top = dragY;
                    vm.$refs.dragLine.style.left =  dragX;

                    vm.$refs.dragLine.style.display = 'block';



                }
            }

            //드래그후 오버시
            function handleDragOver(e) {
                if (e.preventDefault) {
                    e.preventDefault(); // Necessary. Allows us to drop.
                }
                e.dataTransfer.dropEffect= "move"

                return false;
            }

            //드랍시
            function handleDragDrop(e) {
                if (e.stopPropagation) {
                    e.stopPropagation(); // stops the browser from redirecting.
                }
                let dragIdx = vm.dragTarget.parentElement.cellIndex;
                let dropIdx = this.parentElement.cellIndex;

                if(vm.gridOptions.useCheckbox){
                    dragIdx -= 1;
                    dropIdx -= 1;
                }

                let targetCol = vm.columnOptions[dragIdx]
                let data ={
                    type: 'drag',
                    dropIdx :dropIdx,
                    dragIdx :dragIdx,
                    targetCol : targetCol
                };


                vm.columnOptions = data




                return false;

            }

            //드래그 드랍 이벤트 끝날때
            function handleDragEnd(e) {
                vm.dragTarget.classList.remove('dragItem');
                vm.dragTarget.style.opacity = null;
                vm.$refs.dragLine.style.display = 'none';
                vm.dragTarget = null;
                vm.dragTargetPos = null;
            }

            //드래그 타겟 떠날시
            //차후 삭제 예정
            function handleDragLeave(e) {
            }


        }

    },

    mounted() {
        // const vm = this;
        // vm.grips = [];
        // vm.setResizeGrips();
        // vm.syncColumnWidths();

        //컬럼 드래그 선 높이 설정
        // debugger;

        this.$refs.dragLine.style.height = this.$refs.gridTable.clientHeight + 'px';

        //Drag Column Event setting
        this.setDragColumnEvent();
    },

    created() {
        // set grid default style
        this.gridStyle = {
            'width' : typeof this.gridOptions.width === 'number' ? this.gridOptions.width + 'px' : this.gridOptions.width,
            'height': typeof this.gridOptions.height === 'number' ? this.gridOptions.height + 'px' : this.gridOptions.height
        };

        this.titleStyle = {
            'text-align' : this.gridOptions.titleAlign,
            'display'    : 'block'
        };

        let sortOrders = {};
        this.columnOptions.forEach(function (key) {
            sortOrders[key.dataIndex] = 1;
        });
        this.sortOrders = sortOrders;
    },

    beforeDestory () {
        const vm = this;
        vm.grips.forEach((grip) => grip.removeEventListener('mousedown', vm.onMouseDown));
        document.removeEventListener('mousemove', vm.onMouseMove);
        document.removeEventListener('mouseup', vm.onMouseUp);
    }
};