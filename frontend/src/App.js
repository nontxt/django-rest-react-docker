import React, {Component} from "react";
import Modal from "./components/Modal";
import axios from "axios";


class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            tableName: "group",
            currentTable: [],
            modal: false,
            action: null,
            activeItem: {},
            groupList: [],
        };
        this.getList("group");
    }


    getList = (table) => {
        this.setState({tableName: table});
        axios
            .get(`/api/${table}s/`)
            .then((res) => this.setState(
                table === "group" ?
                    {
                        currentTable: res.data,
                        groupList: res.data.map((group) => group.name)
                    } : {currentTable: res.data}))
            .catch((err) => console.log(err));
    };


    toggle = () => {
        this.setState({modal: !this.state.modal});
    };

    handleSubmit = (item) => {
        this.toggle();
        const table = this.state.tableName;

        if (item.id) {
            axios
                .put(`/api/${table}s/${item.id}/`, item)
                .then((res) => this.getList(table))
                .catch((err) => alert(Object.values(err.response.data)[0][0]));
            return;
        }
        axios
            .post(`/api/${table}s/`, item)
            .then((res) => this.getList(table))
            .catch((err) => alert(Object.values(err.response.data)[0][0]));
    };

    handleDelete = (item) => {
        const table = this.state.tableName;

        axios
            .delete(`/api/${table}s/${item.id}/`)
            .then((res) => this.getList(table))
            .catch((err) => alert(err.response.data.detail));
    };

    createItem = () => {
        const user = {username: "", group: ""};
        const group = {name: "", description: ""};


        this.setState({
            activeItem: this.state.tableName === "user" ? user : group,
            modal: !this.state.modal,
            action: "Create new "
        });

    };

    editItem = (item) => {
        this.setState({
            activeItem: item,
            modal: !this.state.modal,
            action: "Edit "
        });
    };


    renderNav = () => {
        return (
            <div className="nav nav-tabs">
                <a href='#' className={this.state.tableName === "user" ? "nav-link active" : "nav-link"}
                   onClick={() => this.getList("user")}
                >
                    Users
                </a>
                <a href='#' className={this.state.tableName === "group" ? "nav-link active" : "nav-link"}
                   onClick={() => this.getList("group")}
                >
                    Groups
                </a>
                <button
                    className="btn btn-primary"
                    onClick={this.createItem}
                >
                    Add {this.state.tableName}
                </button>
            </div>
        );
    };


    renderUser = () => {
        return this.state.currentTable.map((item) => (

            <tr key={item.id}>
                <td>{item.username}</td>
                <td>{item.create}</td>
                <td>{item.group}</td>
                <td>
                    <button className="btn btn-secondary mr-2"
                            onClick={() => this.editItem(item)}>
                        Edit
                    </button>
                    <button className='btn btn-danger'
                            onClick={() => this.handleDelete(item)}>
                        Delete
                    </button>

                </td>
            </tr>
        ));
    };

    renderGroup = () => {
        return this.state.currentTable.map((item) => (
            <tr key={item.id}>
                <td>{item.name}</td>
                <td>{item.description}</td>
                <td>
                    <button className="btn btn-secondary mr-2"
                            onClick={() => this.editItem(item)}>
                        Edit
                    </button>
                    <button className='btn btn-danger'
                            onClick={() => this.handleDelete(item)}>
                        Delete
                    </button>
                </td>
            </tr>
        ));
    };

    render() {
        return (
            <main className="container-fluid">
                {this.renderNav()}

                <div className="row">

                    <div className="mx-auto p-5">

                        <table className='table'>
                            <thead>
                            <tr>

                                {this.state.tableName === "user" ? [<th>Username</th>, <th>Create</th>,
                                    <th>Group</th>] : [<th>Name</th>, <th>Description</th>]}

                                <th className="text-center">Action</th>
                            </tr>

                            </thead>
                            <tbody>
                            {this.state.tableName === "user" ? this.renderUser() : this.renderGroup()}
                            </tbody>
                        </table>
                    </div>

                </div>
                {this.state.modal ? (
                    <Modal
                        activeItem={this.state.activeItem}
                        toggle={this.toggle}
                        onSave={this.handleSubmit}
                        table={this.state.tableName}
                        action={this.state.action}
                        groups={this.state.groupList}
                    />
                ) : null}
            </main>
        );
    }
}

export default App;
