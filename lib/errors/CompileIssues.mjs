export class CompileIssues extends Error {
    static tryThrowingIfErrorsIn({ compileResult = null, ignoreWarnings = true }) {
        if (null != compileResult && Array.isArray(compileResult.errors)) {
            const issuesReported = compileResult.errors.filter(err => 
                (ignoreWarnings && err.type !== 'Warning') ||
                !ignoreWarnings 
            );

            if (issuesReported.length != 0) {
                throw new CompileIssues(issuesReported);
            }
        }
    }

    static _listOfSimpleIssueMessagesFor(rawIssues) {
        return rawIssues.map(rIssue => `[ ${rIssue.sourceLocation.start}:${rIssue.sourceLocation.end} ] ${rIssue.message}`);
    }

    /**
     * @private
     */
    constructor(rawIssues) {
        super(`There are issues with the contract code:\n${CompileIssues._listOfSimpleIssueMessagesFor(rawIssues).join('\n')}`);
        this._issues = rawIssues;
    }

    get issues() {
        return this._issues;
    }
}