import React from "react"

import {
    Section,
    Question,
    TextInput,
    Node,
} from "Components"

var timeout = null;

export class RadioInput extends React.Component {

    constructor(props){
        super(props)

        this.state = {
            selectedChoice: undefined,
            showOnSelection: true,
            responseID:null,
            selfUpdate:false,
        }

        this.onChange = this.onChange.bind(this)
        this.getChoices = this.getChoices.bind(this)
        this.getSubNodes = this.getSubNodes.bind(this)
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if(prevState.selfUpdate) {
            return {selfUpdate:false}
        }

        if(nextProps.response != null && nextProps.node != null && (prevState.selectedChoice == null || nextProps.response._id != prevState.responseID)) {
            var answer = nextProps.response.getAnswerFn(nextProps.node.referenceID, nextProps.instance)
            if(answer && answer.choices.length > 0) {
                return {
                    selectedChoice:answer.choices[0].choiceID,
                    responseID: nextProps.response._id
                }
            } else {
                if(nextProps.response != null)
                    return {selectedChoice:null, responseID:nextProps.response._id}
                else
                    return {selectedChoice:null, responseID:null}
            }
        }
        if(nextProps.response != null)
            return {responseID:nextProps.response._id}
        return null
    }

    onChange(e) {
        if(this.state.selectedChoice == e.target.id) {
            this.setState({selectedChoice:null, selfUpdate:true})
            this.props.deleteAnswer(this.props.response, this.props.node, this.props.instance)
            e.target.checked = false
        } else {
            this.setState({selectedChoice:e.target.id, selfUpdate:true})

            var answer = {instance:this.props.instance}
            answer.choices = [{choiceID:e.target.id}]
            this.props.addAnswer(this.props.response, this.props.node, answer, {maxSelection:1})
        }

        /*if (e.target.getAttribute("index") === undefined || e.target.getAttribute("index") == null) {
            console.log(e.target)
            alert("Something wrong")
            return;
        }
        let index = e.target.getAttribute("index")
        let newSelection = this.props.node.choices[index];

        if(e.target.getAttribute("type") == "text") {
            let answerType = "stringValue";
            let answerVal = e.target.value
            let field = this.props.node.choices[index].field
            if (field.valueType === "decimal"){
                answerType = "numberValue"
            } 

            if(timeout)
                clearTimeout(timeout)
            timeout = setTimeout(() => {
                var choice = {
                    choiceID:newSelection.referenceID,
                    field: {}
                }
                choice.field[answerType] = answerVal
                this.props.addAnswer(this.props.response, this.props.node.referenceID, null, null, [choice], 1)
            }, 1000);
        } else {
            this.props.addAnswer(this.props.response, this.props.node.referenceID, undefined, undefined, [
                {
                    choiceID: newSelection.referenceID
                }
            ], 1)
        }

        e.stopPropagation();*/
    }

    getSubNodes(choiceID) {
        if (!this.props.node.dependencies || this.props.node.dependencies.length == 0)
            return null

        // Don't show when not selected?

        if(this.state.showOnSelection && choiceID != this.state.selectedChoice)
            return null

        var filtered = this.props.node.dependencies
            .filter(dep => choiceID.startsWith(dep.choiceID))
            .map(dep => this.props.getChildrenFn(dep.nodeID))

        if(filtered.length == 0)
            return null

        return (<div className="nested">
            {filtered.map((child, ix) => {
                return <Node
                    key={child.referenceID}
                    id={child.referenceID}
                    node={child}
                    addAnswer={this.props.addAnswer}
                    deleteAnswer={this.props.deleteAnswer}
                    getChildrenFn={this.props.getChildrenFn}
                    response={this.props.response}
                    depth={this.props.depth}
                    instance={this.props.instance}
                    />
                })}
        </div>)
    }

    getField(choice) {
        if(choice.field) {
            return <TextInput 
                node={this.props.node}
                choiceID={choice.referenceID} 
                field={choice.field} 
                options={{maxSelections:1}}
                addAnswer={this.props.addAnswer} 
                deleteAnswer={this.props.deleteAnswer}
                response={this.props.response}
                instance={this.props.instance}
                disabled={this.state.selectedChoice != choice.referenceID}/>
        } else {
            return null
        }

    }

    getChoices() {
        return this.props.node.choices.map((x, ix) => {
            return <div className="radioOption" key={ix}>
                <div className="optionContent">
                    <input 
                        type="radio" 
                        id={x.referenceID} 
                        name={this.props.node.referenceID} 
                        value={x.referenceID}
                        checked={x.referenceID == this.state.selectedChoice} 
                        onChange={this.onChange}></input>
                    <div className="optionLabel"> {x.title} </div>
                    {this.getField(x)}
                    {this.props.showID && <div className="identifier"><span>{x.referenceID}</span></div>}
                </div>
                {this.getSubNodes(x.referenceID)}
            </div>
        })
    }

    render() {
        return (
            <div className="radioInput">
            {this.getChoices()}
            </div>
        )
    }
}