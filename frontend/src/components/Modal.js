import React, {Component} from "react";
import {
    Button,
    Modal,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Form,
    FormGroup,
    Input,
    Label
} from "reactstrap";

export default class CustomModal extends Component {
    constructor(props) {
        super(props);
        this.state = {
            activeItem: this.props.activeItem,
        };
    }

    handleChange = (e) => {
        let {name, value} = e.target;

        const activeItem = {...this.state.activeItem, [name]: value};

        this.setState({activeItem});
    };

    render() {
        const {toggle, onSave, table, action, groups} = this.props;

        const fieldNames = Object.keys(this.state.activeItem).filter(
            (item) => item !== "id" & item !== "create");

        const selectFields = groups.map((name) => (
            <option>{name}</option>
        ));


        const textFields = fieldNames.map((name) => (
            <FormGroup>
                <Label for={`${table}-${name}`}
                       style={{textTransform: 'capitalize'}}>
                    {name}
                </Label>

                <Input
                    type={`${name === "group" ? "select" : "text"}`}
                    id={`${table}-${name}`}
                    name={name}
                    value={this.state.activeItem[name]}
                    onChange={this.handleChange}
                    placeholder={`Enter ${name}`}>

                    ${name === "group" ? <option> </option> : ''}
                    ${name === "group" ? selectFields : ''}
                </Input>


            </FormGroup>
        ));

        return (

            <Modal isOpen={true} toggle={toggle}>
                <ModalHeader toggle={toggle}>{action + table}</ModalHeader>
                <ModalBody>
                    <Form>
                        {textFields}
                    </Form>
                </ModalBody>
                <ModalFooter>
                    <Button
                        color="success"
                        onClick={() => onSave(this.state.activeItem)}
                    >
                        Save
                    </Button>
                </ModalFooter>
            </Modal>
        );
    }
}
