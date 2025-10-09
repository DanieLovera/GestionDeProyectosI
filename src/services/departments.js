import * as apis from "../apis/departments";

const getDepartments = async () => {
    return await apis.getDepartments();
};

export { getDepartments };
