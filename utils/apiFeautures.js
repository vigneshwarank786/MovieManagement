class APIFeatures {
    constructor(query, queryStr) {
        this.query = query;
        this.queryStr = queryStr;
    }

    search() {
        if (this.queryStr.keyword) {
            const keyword = this.queryStr.keyword;

            this.query = this.query.find({
                $or: [
                    { title: { $regex: keyword, $options: 'i' } },
                    { description: { $regex: keyword, $options: 'i' } },
                    { director: { $regex: keyword, $options: 'i' } },
                    { 'cast.actorName': { $regex: keyword, $options: 'i' } },
                    { genre: { $regex: keyword, $options: 'i' } },
                    { category: { $regex: keyword, $options: 'i' } },
                ]
            });
        }
        return this;
    }

    filter() {
        const queryCopy = { ...this.queryStr };

        const removeFields = ['keyword', 'limit', 'page', 'ratings'];
        removeFields.forEach(field => delete queryCopy[field]);

        let queryStr = JSON.stringify(queryCopy);
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, match => `$${match}`);

        this.query = this.query.find(JSON.parse(queryStr));

        return this;
    }

    paginate(resPerPage) {
        const currentPage = Number(this.queryStr.page) || 1;
        const skip = resPerPage * (currentPage - 1);
        this.query = this.query.limit(resPerPage).skip(skip);
        return this;
    }
}

module.exports = APIFeatures;
