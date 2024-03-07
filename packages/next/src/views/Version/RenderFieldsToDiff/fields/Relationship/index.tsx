'use client'
import type { ClientConfig } from 'payload/types'

import { getTranslation } from '@payloadcms/translations'
import { type MappedField, useConfig } from '@payloadcms/ui'
import { fieldAffectsData, fieldIsPresentationalOnly } from 'payload/types'
import React from 'react'
import ReactDiffViewerDefault from 'react-diff-viewer-continued'

import type { Props } from '../types.d.ts'

import Label from '../../Label/index.js'
import { diffStyles } from '../styles.js'
import './index.scss'

const ReactDiffViewer = ReactDiffViewerDefault.default

const baseClass = 'relationship-diff'

type RelationshipValue = Record<string, any>

const generateLabelFromValue = (
  collections: ClientConfig['collections'],
  field: MappedField,
  locale: string,
  value: { relationTo: string; value: RelationshipValue } | RelationshipValue,
): string => {
  let relation: string
  let relatedDoc: RelationshipValue
  let valueToReturn = '' as any

  const relationTo = 'relationTo' in field ? field.relationTo : undefined

  if (value === null || typeof value === 'undefined') {
    return String(value)
  }

  if (Array.isArray(relationTo)) {
    if (typeof value === 'object') {
      relation = value.relationTo
      relatedDoc = value.value
    }
  } else {
    relation = relationTo
    relatedDoc = value
  }

  const relatedCollection = collections.find((c) => c.slug === relation)

  if (relatedCollection) {
    const useAsTitle = relatedCollection?.admin?.useAsTitle
    const useAsTitleField = relatedCollection.fields.find(
      (f) => fieldAffectsData(f) && !fieldIsPresentationalOnly(f) && f.name === useAsTitle,
    )
    let titleFieldIsLocalized = false

    if (useAsTitleField && fieldAffectsData(useAsTitleField))
      titleFieldIsLocalized = useAsTitleField.localized

    if (typeof relatedDoc?.[useAsTitle] !== 'undefined') {
      valueToReturn = relatedDoc[useAsTitle]
    } else if (typeof relatedDoc?.id !== 'undefined') {
      valueToReturn = relatedDoc.id
    }

    if (typeof valueToReturn === 'object' && titleFieldIsLocalized) {
      valueToReturn = valueToReturn[locale]
    }
  }

  return valueToReturn
}

const Relationship: React.FC<Props> = ({ comparison, field, i18n, locale, version }) => {
  let placeholder = ''

  const { collections } = useConfig()

  if (version === comparison) placeholder = `[${i18n.t('general:noValue')}]`

  let versionToRender = version
  let comparisonToRender = comparison

  if (field.hasMany) {
    if (Array.isArray(version))
      versionToRender = version
        .map((val) => generateLabelFromValue(collections, field, locale, val))
        .join(', ')
    if (Array.isArray(comparison))
      comparisonToRender = comparison
        .map((val) => generateLabelFromValue(collections, field, locale, val))
        .join(', ')
  } else {
    versionToRender = generateLabelFromValue(collections, field, locale, version)
    comparisonToRender = generateLabelFromValue(collections, field, locale, comparison)
  }

  const label = 'label' in field && typeof field.label !== 'boolean' ? field?.label : ''

  return (
    <div className={baseClass}>
      <Label>
        {locale && <span className={`${baseClass}__locale-label`}>{locale}</span>}
        {getTranslation(label, i18n)}
      </Label>
      <ReactDiffViewer
        hideLineNumbers
        newValue={typeof versionToRender !== 'undefined' ? String(versionToRender) : placeholder}
        oldValue={
          typeof comparisonToRender !== 'undefined' ? String(comparisonToRender) : placeholder
        }
        showDiffOnly={false}
        splitView
        styles={diffStyles}
      />
    </div>
  )
}

export default Relationship
